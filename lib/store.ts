import type { BlockedPeriod, Booking, Enquiry, Settings } from '@/lib/types';
import seedBookings from '@/data/bookings.json';
import seedEnquiries from '@/data/enquiries.json';
import seedBlockedPeriods from '@/data/blocked-periods.json';
import seedSettings from '@/data/settings.json';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const useRuntimeMemory = Boolean(process.env.VERCEL);

type RuntimeData = {
  bookings: Booking[];
  enquiries: Enquiry[];
  blockedPeriods: BlockedPeriod[];
  settings: Settings;
};

type StoreGlobal = typeof globalThis & {
  __courtsideRuntimeData?: RuntimeData;
};

const storeGlobal = globalThis as StoreGlobal;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSeedData(): RuntimeData {
  return {
    bookings: clone(seedBookings as unknown as Booking[]),
    enquiries: clone(seedEnquiries as unknown as Enquiry[]),
    blockedPeriods: clone(seedBlockedPeriods as unknown as BlockedPeriod[]),
    settings: clone(seedSettings as unknown as Settings),
  };
}

function runtimeData() {
  if (!storeGlobal.__courtsideRuntimeData) {
    storeGlobal.__courtsideRuntimeData = createSeedData();
  }
  return storeGlobal.__courtsideRuntimeData;
}

let writeQueue = Promise.resolve();
let bookingMutationQueue = Promise.resolve();

async function withBookingLock<T>(task: () => Promise<T>): Promise<T> {
  const run = bookingMutationQueue.then(task, task);
  bookingMutationQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(dataDir, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    if (!content.trim()) return clone(fallback);
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Unable to read ${fileName}; using bundled demo data.`, error);
    return clone(fallback);
  }
}

async function writeJson<T>(fileName: string, value: T): Promise<void> {
  const filePath = path.join(dataDir, fileName);
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(dataDir, { recursive: true });
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
  });
  await writeQueue;
}

export const store = {
  getBookings: () =>
    useRuntimeMemory
      ? Promise.resolve(clone(runtimeData().bookings))
      : readJson<Booking[]>('bookings.json', seedBookings as unknown as Booking[]),
  saveBookings: (value: Booking[]) => {
    if (useRuntimeMemory) {
      runtimeData().bookings = clone(value);
      return Promise.resolve();
    }
    return writeJson('bookings.json', value);
  },
  withBookingLock,
  getEnquiries: () =>
    useRuntimeMemory
      ? Promise.resolve(clone(runtimeData().enquiries))
      : readJson<Enquiry[]>('enquiries.json', seedEnquiries as unknown as Enquiry[]),
  saveEnquiries: (value: Enquiry[]) => {
    if (useRuntimeMemory) {
      runtimeData().enquiries = clone(value);
      return Promise.resolve();
    }
    return writeJson('enquiries.json', value);
  },
  getBlockedPeriods: () =>
    useRuntimeMemory
      ? Promise.resolve(clone(runtimeData().blockedPeriods))
      : readJson<BlockedPeriod[]>('blocked-periods.json', seedBlockedPeriods as unknown as BlockedPeriod[]),
  saveBlockedPeriods: (value: BlockedPeriod[]) => {
    if (useRuntimeMemory) {
      runtimeData().blockedPeriods = clone(value);
      return Promise.resolve();
    }
    return writeJson('blocked-periods.json', value);
  },
  getSettings: () =>
    useRuntimeMemory
      ? Promise.resolve(clone(runtimeData().settings))
      : readJson<Settings>('settings.json', seedSettings as unknown as Settings),
  saveSettings: (value: Settings) => {
    if (useRuntimeMemory) {
      runtimeData().settings = clone(value);
      return Promise.resolve();
    }
    return writeJson('settings.json', value);
  },
};
