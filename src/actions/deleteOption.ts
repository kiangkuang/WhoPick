import { ActionContext } from '.';
import { removeOption } from '../repository';
import { refresh } from './refresh';

export async function deleteOption(ctx: ActionContext) {
  const [, , optionId] = ctx.match;

  await removeOption(parseInt(optionId));

  await refresh(ctx, true);
}
