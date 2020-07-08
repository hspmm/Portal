import { PluginInstancePipe } from './plugin-instance.pipe';

describe('PluginInstancePipe', () => {
  it('create an instance', () => {
    const pipe = new PluginInstancePipe();
    expect(pipe).toBeTruthy();
  });
});
