import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  Account,
  accountsTable,
  Transaction,
  transactionsTable,
} from "@/db/schema";
import { TransactionType } from "@/types/enums";
import { fetchAccountBalances } from "./accountQueries";
import { fetchRandomSubcategoryWithCategory } from "./categoryQueries";
import { and, eq, inArray, sql, between } from "drizzle-orm";
import { format, subDays, startOfMonth, subMonths } from "date-fns";

export type DateFilterPreset =
  | "today"
  | "last7days"
  | "thisMonth"
  | "last6months"
  | "year";

export type DateFilterCustom = {
  startDate: Date;
  endDate: Date;
};

export type TransactionForStatistics = {
  value: number;
  label: string;
  type: TransactionType;
};

// export type DateFilter =
//   | "today"
//   | "last7days"
//   | "thisMonth"
//   | "last6months"
//   | "year"
//   | { startDate: Date; endDate: Date };

export type DateFilter = DateFilterPreset | DateFilterCustom;

export interface TransactionSection {
  date: string;
  sectionAmount: number;
  closingBalance: number;
  transactions: TransactionWithBalance[];
}

export interface TransactionWithBalance extends Transaction {
  closingBalance: number;
}

export const seedDummyTransactions = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
) => {
  try {
    await drizzleDb.delete(transactionsTable);

    const transactions = await drizzleDb.select().from(transactionsTable);
    if (transactions.length > 0) {
      console.log("Transactions already exist, skipping dummy transactions");
      return transactions;
    }

    const startDate = new Date(2024, 0, 1); // Jan 1, 2024
    const endDate = new Date(); // Current date

    // Create a map to track account balances <ID, Balance>
    const accountBalances = await fetchAccountBalances(drizzleDb);

    const dummyTransactions = [];

    for (let i = 0; i < 1500; i++) {
      const isIncome = Math.random() > 0.6; // 40% chance of income
      const transactionAmount = isIncome
        ? Math.floor(Math.random() * 1000) + 1000 // Income: 500-1000
        : Math.floor(Math.random() * 500) + 500; // Expense: 200-500

      const subCategoryWithCategory = await fetchRandomSubcategoryWithCategory(
        drizzleDb
      );
      const accountId = Math.floor(Math.random() * 3) + 1;
      const type = isIncome ? TransactionType.Income : TransactionType.Spent;

      // Calculate amount based on transaction type
      const amount =
        type === TransactionType.Income
          ? transactionAmount
          : -transactionAmount;

      // Update running balance for this account
      const currentBalance = accountBalances.get(accountId) || 0;
      const newBalance = currentBalance + amount;
      accountBalances.set(accountId, newBalance);

      dummyTransactions.push({
        amount,
        note: isIncome ? "Monthly income" : "Regular expense",
        payee: payees[Math.floor(Math.random() * payees.length)],
        date: generateRandomDate(startDate, endDate).toISOString(),
        type,
        accountId, // Assuming you have accounts 1-3
        categoryId: subCategoryWithCategory?.categoryId ?? 1,
        subCategoryId: subCategoryWithCategory?.id ?? 1,
        labelIds: JSON.stringify([
          Math.floor(Math.random() * 3) + 1, // Random label IDs
          Math.floor(Math.random() * 3) + 1,
        ]),
      });
    }

    const insertedTransactions = await drizzleDb
      .insert(transactionsTable)
      .values(dummyTransactions)
      .returning();

    // Update account balances in the database
    for (const [accountId, balance] of accountBalances) {
      await drizzleDb
        .update(accountsTable)
        .set({ amount: balance })
        .where(eq(accountsTable.id, accountId));
    }

    console.log(
      `${insertedTransactions.length} dummy transactions added successfully`
    );
    console.log(
      "Updated account balances:",
      Object.fromEntries(accountBalances)
    );
    return insertedTransactions;
  } catch (error) {
    console.error("Error adding dummy transactions:", error);
    throw error;
  }
};

export const insertTransaction = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  transaction: Omit<Transaction, "id">
): Promise<Transaction> => {
  try {
    const account = await drizzleDb
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, transaction.accountId))
      .limit(1);

    if (!account[0]) {
      throw new Error("Account not found");
    }

    // Calculate new balance based on transaction type
    const currentBalance = account[0].amount;
    const balanceChange = transaction.amount; // Amount is already negative for expenses
    const newBalance = currentBalance + balanceChange;

    // Insert transaction
    const result = await drizzleDb
      .insert(transactionsTable)
      .values(transaction)
      .returning();

    // Update account balance
    await drizzleDb
      .update(accountsTable)
      .set({ amount: newBalance })
      .where(eq(accountsTable.id, transaction.accountId));

    console.log(`Account balance updated: ${currentBalance} -> ${newBalance}`);

    return result[0];
  } catch (error) {
    console.error("Error inserting label:", error);
    throw error;
  }
};

export const fetchTransactions = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  selectedAccount: Account
): Promise<{
  transactions: Transaction[];
  incomeTotal: number;
  spentTotal: number;
}> => {
  try {
    let transactions: Transaction[] = [];
    if (selectedAccount?.id === -1) {
      // Fetch all transactions
      transactions = await drizzleDb.select().from(transactionsTable);
    } else {
      // Fetch transactions for the selected account
      transactions = await drizzleDb
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.accountId, selectedAccount.id));
    }

    const { income, spent } = transactions.reduce(
      (totals, transaction) => {
        if (transaction.type === TransactionType.Income) {
          totals.income += transaction.amount;
        } else if (transaction.type === TransactionType.Spent) {
          totals.spent += transaction.amount;
        }
        return totals;
      },
      { income: 0, spent: 0 } // Initial values
    );

    return { transactions, incomeTotal: income, spentTotal: spent };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const fetchFilteredTransactions = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  accountIds: number[],
  labelsIds: number[],
  categoryIds: {
    categoryId: number;
    subcategoryId: number;
  }[],
  dateFilter: DateFilter
): Promise<TransactionSection[]> => {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);
    const CHUNK_SIZE = 50;

    // Get initial balance before start date
    const initialBalance = await getInitialBalance(
      drizzleDb,
      accountIds,
      labelsIds,
      categoryIds,
      startDate
    );

    const whereConditions = [
      inArray(transactionsTable.accountId, accountIds),
      between(
        sql`date(${transactionsTable.date})`,
        sql`date(${startDate.toISOString()})`,
        sql`date(${endDate.toISOString()})`
      ),
    ];

    if (labelsIds.length > 0) {
      const labelConditions = labelsIds.map(
        (labelId) =>
          sql`json_extract(${transactionsTable.labelIds}, '$') LIKE '%' || ${labelId} || '%'`
      );
      whereConditions.push(sql`(${sql.join(labelConditions, sql` OR `)})`);
    }

    if (categoryIds.length > 0) {
      const categoryConditions = categoryIds.map(
        ({ categoryId, subcategoryId }) =>
          sql`(${transactionsTable.categoryId} = ${categoryId} AND ${transactionsTable.subCategoryId} = ${subcategoryId})`
      );
      whereConditions.push(sql`(${sql.join(categoryConditions, sql` OR `)})`);
    }

    // Fetch all transactions first
    const transactions = await drizzleDb
      .select()
      .from(transactionsTable)
      .where(and(...whereConditions))
      .orderBy(sql`datetime(${transactionsTable.date}) ASC`);

    // Process transactions in chunks while maintaining running balance
    let runningBalance = initialBalance;
    const transactionsByDate = new Map<string, TransactionWithBalance[]>();

    for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
      const chunk = transactions.slice(i, i + CHUNK_SIZE);

      // Process chunk and update running balance
      chunk.forEach((tx) => {
        runningBalance += tx.amount;
        const dateKey = format(new Date(tx.date), "yyyy-MM-dd");

        if (!transactionsByDate.has(dateKey)) {
          transactionsByDate.set(dateKey, []);
        }

        transactionsByDate.get(dateKey)!.push({
          ...tx,
          closingBalance: runningBalance,
        });
      });

      // Allow UI to update between chunks
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Convert grouped transactions to sections
    const sections: TransactionSection[] = Array.from(
      transactionsByDate.entries()
    )
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort DESC
      .map(([date, dayTransactions]) => {
        const sectionIncome = dayTransactions
          .filter((trans) => trans.type === TransactionType.Income)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const sectionExpense = dayTransactions
          .filter((trans) => trans.type === TransactionType.Spent)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        return {
          date,
          sectionAmount: sectionIncome - sectionExpense,
          closingBalance: dayTransactions[0].closingBalance,
          transactions: dayTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        };
      });

    return sections;
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    throw error;
  }
};

export const fetchTransactionsForStatistics = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  accountIds: number[],
  dateFilter: DateFilter
): Promise<{
  income: TransactionForStatistics[];
  spent: TransactionForStatistics[];
}> => {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);

    const whereConditions = [
      inArray(transactionsTable.accountId, accountIds),
      sql`datetime(${
        transactionsTable.date
      }) >= datetime(${startDate.toISOString()})`,
      sql`datetime(${
        transactionsTable.date
      }) <= datetime(${endDate.toISOString()})`,
    ];

    const transactions = await drizzleDb
      .select()
      .from(transactionsTable)
      .where(and(...whereConditions))
      .orderBy(sql`datetime(${transactionsTable.date}) ASC`);

    const dates = getDatesInRange(startDate, endDate);
    const transactionsByDate = new Map<
      string,
      { income: number; spent: number }
    >();

    dates.forEach((date) => {
      const formattedDate = getFormattedDate(date, dateFilter);
      transactionsByDate.set(formattedDate, {
        income: 0,
        spent: 0,
      });
    });

    transactions.forEach((transaction) => {
      const txDate = new Date(transaction.date);
      let formattedDate: string;

      if (dateFilter === "today") {
        // Find nearest time slot for today's transactions
        formattedDate = findNearestTimeSlot(txDate, dates);
      } else {
        formattedDate = getFormattedDate(txDate, dateFilter);
      }

      // Only process if the time slot exists
      if (transactionsByDate.has(formattedDate)) {
        const current = transactionsByDate.get(formattedDate)!;

        if (transaction.type === TransactionType.Income) {
          current.income += transaction.amount;
        } else {
          current.spent += Math.abs(transaction.amount);
        }

        transactionsByDate.set(formattedDate, current);
      }
    });

    // Convert to required format
    const income: TransactionForStatistics[] = Array.from(
      transactionsByDate.entries()
    ).map(([label, values]) => ({
      value: values.income,
      label,
      type: TransactionType.Income,
    }));

    const spent: TransactionForStatistics[] = Array.from(
      transactionsByDate.entries()
    ).map(([label, values]) => ({
      value: values.spent,
      label,
      type: TransactionType.Spent,
    }));

    return { income, spent };
  } catch (error) {
    console.error("Error fetching transactions for Statistics:", error);
    throw error;
  }
};

export const fetchTopTransactionsForStatistics = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  accountIds: number[],
  dateFilter: DateFilter
): Promise<{
  topIncome: Transaction[];
  topSpent: Transaction[];
}> => {
  try {
    const { startDate, endDate } = getDateRange(dateFilter);

    const whereConditions = [
      inArray(transactionsTable.accountId, accountIds),
      sql`datetime(${
        transactionsTable.date
      }) >= datetime(${startDate.toISOString()})`,
      sql`datetime(${
        transactionsTable.date
      }) <= datetime(${endDate.toISOString()})`,
    ];

    // Fetch top 10 income transactions
    const topIncome = await drizzleDb
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.type, TransactionType.Income),
          ...whereConditions
        )
      )
      .orderBy(sql`${transactionsTable.amount} DESC`)
      .limit(10);

    // Fetch top 10 spent transactions
    const topSpent = await drizzleDb
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.type, TransactionType.Spent),
          ...whereConditions
        )
      )
      .orderBy(sql`ABS(${transactionsTable.amount}) DESC`)
      .limit(10);

    return { topIncome, topSpent };
  } catch (error) {
    console.error("Error fetching transactions for Statistics:", error);
    throw error;
  }
};

const getDateRange = (
  dateFilter: DateFilter
): { startDate: Date; endDate: Date } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (typeof dateFilter === "object") {
    return dateFilter;
  }

  switch (dateFilter) {
    case "today":
      return {
        startDate: today,
        endDate,
      };
    case "last7days":
      return {
        startDate: subDays(today, 7),
        endDate,
      };
    case "thisMonth":
      return {
        startDate: startOfMonth(today),
        endDate,
      };
    case "last6months":
      return {
        startDate: subMonths(today, 6),
        endDate,
      };
    case "year":
      return {
        startDate: subMonths(today, 12),
        endDate,
      };
    default:
      throw new Error("Invalid date filter");
  }
};

const getDatesInRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Check if the date range is within the same day (today)
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (isToday(startDate) && isToday(endDate)) {
    // For today, create hourly intervals
    let currentHour = new Date(startDate);
    while (currentHour <= endDate) {
      dates.push(new Date(currentHour));
      currentHour.setHours(currentHour.getHours() + 1);
    }
  } else {
    // For other date ranges, continue with daily intervals
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  // console.log(
  //   "Dates in range:",
  //   dates.map((d) => format(d, "HH:mm"))
  // );
  return dates;
};

const getFormattedDate = (date: Date, dateFilter: DateFilter): string => {
  if (typeof dateFilter === "object") {
    return format(date, "yyyy-MM-dd");
  }

  switch (dateFilter) {
    case "today":
      return format(date, "HH:mm"); // Only time for today
    case "last7days":
      return format(date, "dd MMM"); // Date and month for last 7 days
    case "thisMonth":
      return format(date, "dd MMM"); // Date and month for this month
    case "last6months":
      return format(date, "MMM"); // Only month for last 6 months
    case "year":
      return format(date, "MMM"); // Only month for year
    default:
      return format(date, "yyyy-MM-dd");
  }
};

const getInitialBalance = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  accountIds: number[],
  labelIds: number[],
  categoryIds: {
    categoryId: number;
    subcategoryId: number;
  }[],
  beforeDate: Date
): Promise<number> => {
  try {
    // Build where conditions
    const conditions = [
      inArray(transactionsTable.accountId, accountIds),
      sql`date(${transactionsTable.date}) < date(${beforeDate.toISOString()})`,
    ];

    if (labelIds.length > 0) {
      const labelConditions = labelIds.map(
        (labelId) =>
          sql`json_extract(${transactionsTable.labelIds}, '$') LIKE '%' || ${labelId} || '%'`
      );
      conditions.push(sql`(${sql.join(labelConditions, sql` OR `)})`);
    }

    if (categoryIds.length > 0) {
      const categoryConditions = categoryIds.map(
        ({ categoryId, subcategoryId }) =>
          sql`(${transactionsTable.categoryId} = ${categoryId} AND ${transactionsTable.subCategoryId} = ${subcategoryId})`
      );
      conditions.push(sql`(${sql.join(categoryConditions, sql` OR `)})`);
    }

    const result = await drizzleDb
      .select({
        total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
      })
      .from(transactionsTable)
      .where(and(...conditions));

    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error calculating initial balance:", error);
    return 0;
  }
};

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const findNearestTimeSlot = (
  transactionDate: Date,
  timeSlots: Date[]
): string => {
  const txTime = transactionDate.getTime();
  let nearestSlot = timeSlots[0];
  let minDiff = Math.abs(txTime - timeSlots[0].getTime());

  for (const slot of timeSlots) {
    const diff = Math.abs(txTime - slot.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      nearestSlot = slot;
    }
  }
  return format(nearestSlot, "HH:mm");
};

const payees = [
  "Walmart",
  "Amazon",
  "Target",
  "Costco",
  "Netflix",
  "Spotify",
  "Apple",
  "Uber",
  "Starbucks",
  "McDonald's",
  "Shell Gas",
  "AT&T",
  "Rent Payment",
  "Salary Deposit",
  "Freelance Work",
  "Dividend Payment",
  "Interest Income",
];
