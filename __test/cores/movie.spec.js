import {List, Map} from 'immutable';
import {expect} from 'chai';

import {setEntries} from '../../app/scripts/cores/movie';

describe('application logic', () => {

  describe('setEntries', () => {

    const state = Map();

    it('adds the entries to the state', () => {
      const entries = List.of('The Grand Budapest Hotel', 'Inglourious Basterds');
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(Map({
        entries: List.of('The Grand Budapest Hotel', 'Inglourious Basterds'),
      }));
    });

    it('converts to immutable', () => {
      const entries = ['The Grand Budapest Hotel', 'Inglourious Basterds'];
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(Map({
        entries: List.of('The Grand Budapest Hotel', 'Inglourious Basterds'),
      }));
    });

    it('checks type of arguments', () => {
      expect(setEntries.bind(null, {}, [])).to.throw(Error);
      expect(setEntries.bind(null, Map(), {length: 0})).to.throw(Error);
    });

  });

});
