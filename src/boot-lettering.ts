// The original animated lettering used licensed artwork. This blog uses text.
export async function loadBootWebfonts() { return false; }
export class BootLettering {
  constructor(private host: HTMLElement, _keys: string[]) {}
  setText(value: string) { this.host.textContent = value; }
}
