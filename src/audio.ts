// Audio is intentionally disabled for the public blog: the reference project
// includes samples that are outside its MIT grant.
export type Sound = 'page-open'|'page-close'|'ui-tick'|'brand'|'text-reveal'|'key'|'tick'|'column'|'open'|'confirm'|'back'|'scan'|'welcome'|'array'|'inspect'|'explode'|'assemble';
export type SoundScene = 'boot'|'archive'|'detail'|'viewer';
export type AudioPreferences = { sound:boolean; music:boolean; soundVolume:number; musicVolume:number };
export class TerminalAudio {
  configure(_prefs: AudioPreferences) {}
  play(_sound: Sound, _pan = 0) {}
  setScene(_scene: SoundScene) {}
  restartBoot() {}
  updateBoot(_time: number, _frozen: boolean) {}
  holdForEntry() {}
  releaseEntry() {}
  cancelEntry() {}
  setHostPaused(_paused: boolean) {}
  async prepareMusic() { return false; }
  async unlock() { return true; }
  stats() { return { enabled: false }; }
  dispose() {}
}
