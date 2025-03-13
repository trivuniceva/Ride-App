import { VehicleClassPipe } from './vehicle-class.pipe';

describe('VehicleClassPipe', () => {
  it('create an instance', () => {
    const pipe = new VehicleClassPipe();
    expect(pipe).toBeTruthy();
  });
});
