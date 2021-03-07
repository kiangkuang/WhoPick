import { Context, Scenes } from 'telegraf';

interface WhoPickSession extends Scenes.SceneSession {
  questionId: number
  optionId: number
}

export interface WhoPickContext extends Context {
  session: WhoPickSession
  scene: Scenes.SceneContextScene<WhoPickContext>
}
