export enum SceneId {
  Start = 'Start',
  AddOption = 'AddOption',
  ShowPoll = 'ShowPoll',
  Refresh = 'Refresh',
  EditQuestion = 'EditQuestion',
}

export enum Action {
  RefreshAdmin = 'refreshAdmin',
  Refresh = 'refresh',
  Vote = 'vote',
  SetQuestion = 'setQuestion',
  Edit = 'edit',
  EditQuestion = 'editQuestion',
  EditOptionsMenu = 'editOptionsMenu',
  AddOptions = 'addOptions',
  EditOptions = 'editOptions',
  DeleteOptions = 'deleteOptions',
  EditOption = 'editOption',
  DeleteOption = 'deleteOption',
}

export function getActionRegExp(action: Action): RegExp {
  return new RegExp(`^${action}:`);
}
