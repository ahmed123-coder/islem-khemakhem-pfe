import { BillingService } from '../lib/billing';

async function run() {
  console.log('--- STARTING BILLING RUN ---');
  try {
    await BillingService.monitorAndRenewSubscriptions();
    console.log('--- BILLING RUN COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('--- BILLING RUN FAILED ---', error);
    process.exit(1);
  }
}

run();
