import * as wf from '@temporalio/workflow';
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

type WorkflowArgs = {
  name: string;
};

export const unblockSignal = wf.defineSignal('unblock');
export const isBlockedQuery = wf.defineQuery<boolean>('isBlocked');

const {
  greet,
  greetAsync,
} = proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: 2,
  },
  startToCloseTimeout: '30 seconds',
});

export async function greetChain(args: WorkflowArgs): Promise<void> {
  const {name} = args;
  let isBlocked = true;
  wf.setHandler(unblockSignal, () => void (isBlocked = false));
  wf.setHandler(isBlockedQuery, () => isBlocked);
  console.log('Blocked');
  const greetingAsync = await greetAsync(name);
  console.log(greetingAsync);
  console.log('... waiting to be unblocked ...');
  try {
    await wf.condition(() => !isBlocked);
    console.log('Unblocked');
    const greeting = await greet(name);
    console.log(greeting);
    console.log('workflow completed!');
  } catch (err) {
    if (err instanceof wf.CancelledFailure) {
      console.log('Cancelled');
    }
    throw err;
  }
}
