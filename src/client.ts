import express, { Express, Request, Response } from 'express';
import { WorkflowClient } from '@temporalio/client';
import { greetChain } from './workflows';
import { unblockSignal } from './workflows';

const app: Express = express();
const port = process.env.PORT ?? 8080;

app.use(express.json());

app.post('/start', (req: Request, res: Response) => {
  const { id } = req.body;
  const client = new WorkflowClient();
  
  const workflowId = `workflow-${id}`;
  const _handle = client.start(greetChain, {
    args: [{ name: id }], // Note: everything is typed
    taskQueue: 'greetchain-queue',
    workflowId,
  }).then(() => {
    console.log(`Workflow ${workflowId} started, now you can signal, query, or cancel it`);
    res.send(`WorkflowId: ${workflowId} started.`);
  });
});

app.post('/unblock', async (req: Request, res: Response) => {
  const { id } = req.body;
  const client = new WorkflowClient();
  const workflowId = `workflow-${id}`;
  const handle = await client.getHandle(workflowId);
  await handle.signal(unblockSignal);
  console.log('Signal sent');
  res.send('Unblock signal sent');
})

app.post('/cancel', async (req: Request, res: Response) => {
    const { id } = req.body;
    const client = new WorkflowClient();
    const workflowId = `workflow-${id}`;
    const handle = await client.getHandle(workflowId);
    await handle.cancel();
    console.log('workflow canceled');
    res.send('Workflow canceled');
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});