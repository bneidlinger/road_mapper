import { EventEmitter } from './EventEmitter.js';

export class Store extends EventEmitter {
  constructor(initialState = {}) {
    super();
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    const oldState = this.state;
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', { oldState, newState: this.state });
  }

  subscribe(listener) {
    return this.on('stateChange', listener);
  }
}