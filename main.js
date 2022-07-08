const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const defaultRotors = [
  ['ID', { glyphs: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', notchPositions: [0] }],
  ['I', { glyphs: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notchPositions: [16] }],
  ['II', { glyphs: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notchPositions: [4] }],
  ['III', { glyphs: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notchPositions: [21] }],
  ['IV', { glyphs: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notchPositions: [9] }],
  ['V', { glyphs: 'VZBRGITYUPSDNHLXAWMJQOFECK', notchPositions: [25] }],
  ['VI', { glyphs: 'JPGVOUMFYQBENHZRDKASXLICTW', notchPositions: [12, 25] }],
  ['VII', { glyphs: 'NZJHGRCXMYSWBOUFAIVLPEKQDT', notchPositions: [12, 25] }],
  ['VIII', { glyphs: 'FKQHTLXOCBJSPDZRAMEWNIUYGV', notchPositions: [12, 25] }],
];

const defaultReflectors = [
  ['ID', 'ZYXWVUTSRQPONMLKJIHGFEDCBA'],
  ['B', 'YRUHQSLDPXNGOKMIEBFZCWVJAT'],
  ['C', 'FVPJIAOYEDRZXWGCTKUQSBNMHL'],
];


const rotors = new Map(defaultRotors);
const reflectors = new Map(defaultReflectors);

const newMachine = () => {
  const left = Symbol('left');
  const middle = Symbol('middle');
  const right = Symbol('right');

  const forward = Symbol('forward');
  const reverse = Symbol('reverse');

  const glyphStringToMap = (str, direction = forward) => direction === forward
    ? new Map(str.split('').map((char, idx) => ([ alphabet[idx], char])))
    : new Map(str.split('').map((char, idx) => ([ char, alphabet[idx]])));

  const rotorIsAtNotch = (rotorKey) => {
    const rotor = state.rotors[rotorKey];
    return rotor.notchPositions.includes(rotor.position);
  };

  const state = {
    rotors: {
      [left]: { ...rotors.get('ID'), ringSetting: 0, position: 0 },
      [middle]: { ...rotors.get('ID'), ringSetting: 0, position: 0 },
      [right]: { ...rotors.get('ID'), ringSetting: 0, position: 0 },
    },

    plugboard: glyphStringToMap(alphabet.join('')),
    reflector: glyphStringToMap(reflectors.get('ID')),
  };

  const turnRotor = (rotor) => {
    state.rotors[rotor].position = (state.rotors[rotor].position + 1) % 26;
  };

  const rotate = () => {
      // if middle rotor is at notch turn the left and middle rotors
      if (rotorIsAtNotch(middle)) { turnRotor(left) && turnRotor(middle); }

      // if right rotor is at notch turn the middle rotor (again, possibly)
      if (rotorIsAtNotch(right)) { turnRotor(middle); }

      // increment righttmost rotor no matter what
      turnRotor(right);
  };

  const encipher = (index, rotorKey, direction = forward) => {
    const rotor = state.rotors[rotorKey];

    const shift = rotor.position - rotor.ringSetting;

    const rotorInputCharacter = alphabet[(index + shift) % 26];
    const rotorOutputCharacter = glyphStringToMap(rotor.glyphs, direction)
      .get(rotorInputCharacter);

    let outputIndex = alphabet.indexOf(rotorOutputCharacter) - shift;
    if (outputIndex < 0) { outputIndex += 26; }

    return [
      outputIndex,
      rotorOutputCharacter,
    ];
  };

  return {
    // for debugging
    rotors() { return state.rotors; },

    insertRotor(rotor, slotString, ringSetting = 0, position = 0) {
      /* NOTE: so this is a way that I like to get around the lack of
      pattern matching in js. The variable (slot in this case) is assigned
      to the result of an IIFE, which is just a break-free mutually exclusive
      path switch-case block. In this case I'm using it to pick from the
      available symbols (defined above) so the configuration can be done
      by string */

      const slot = (() => {
        switch (slotString) {
          case 'left': { return left; }
          case 'middle': { return middle; }
          case 'right': { return right; }
          default: { return null; }
        }
      })();

      state.rotors[slot] = { ...rotor, ringSetting, position };
    },

    addPlugboardConnection(x, y) {
      state.plugboard.set(x, y);
      state.plugboard.set(y, x);
    },

    removePlugboardConnection(x) {
      const y = state.plugboard.get(x);
      state.plugboard.set(x, x);
      state.plugboard.set(y, y);
    },

    // NOTE: this is a convenient but unrealistic time saver
    setFullPlugboard(map) { state.plugboard = map },

    setReflector(reflector) { state.reflector = glyphStringToMap(reflector); },

    encrypt(character, debug = false) {
      // rotate the rotors according to their notches
      rotate();

      // NOTE: each step saves to a variable for for understandability
      // and so that you can put in logging or 'test-point' output easily
      const ctoi = c => alphabet.indexOf(c);

      // pass input through plugboard
      const plugOut = state.plugboard.get(character.toUpperCase());

      // pass through stator, which never changes anything
      // included for completeness and pedagogy
      const statorOut = plugOut;

      // pass through right, middle left (forward wired)
      const rightOut = encipher(ctoi(plugOut), right, forward);
      const middleOut = encipher(rightOut[0], middle, forward);
      const leftOut = encipher(middleOut[0], left, forward);

      // pass through reflector
      const reflectorOut = state.reflector.get(leftOut[1]);

      // pass through left middle right (reverse wired)
      const leftOut2 = encipher(ctoi(reflectorOut), left, reverse);
      const middleOut2 = encipher(leftOut2[0], middle, reverse);
      const rightOut2 = encipher(middleOut2[0], right, reverse);

      // pass thrugh stator (etw)
      const statorOut2 = alphabet[rightOut2[0]];

      // pass through plugboard again
      const plugOut2 = state.plugboard.get(statorOut2);

      if (debug) {
        console.log(
          Object.getOwnPropertySymbols(state.rotors)
            .map(x => state.rotors[x].position)
        );

        const itoc = i => alphabet[i];

        console.log({
          plugOut,
          statorOut,
          rightOut: [itoc(rightOut[0]), rightOut[1]],
          middleOut: [itoc(middleOut[0]), middleOut[1]],
          leftOut: [itoc(leftOut[0]), leftOut[1]],
          reflectorOut,
          leftOut2: [itoc(leftOut2[0]), leftOut2[1]],
          middleOut2: [itoc(middleOut2[0]), middleOut2[1]],
          rightOut2: [itoc(rightOut2[0]), rightOut2[1]],
          statorOut2,
          plugOut2,
        });
      }

      // return final result
      return plugOut2;
    },

    // NOTE: not how the machine actually works but easier to use
    encryptString(string, debug = false) {
      const encrypted = string.split('')
        .filter(c => c !== ' ')
        .map(c => this.encrypt(c, debug));

      const chunkArray = (array, size) => array.length <= size
        ? [array]
        : [array.slice(0, size), ...chunkArray(array.slice(size), size)];

      return chunkArray(encrypted, 5, true)
        .map((chunk, index, chunks) => (
         index < chunks.length - 1
          ? [...chunk, ' ']
          : chunk
        ))
        .map(chunk => chunk.join(''))
        .join('');
    },
  };
};

const machine = newMachine();

machine.insertRotor(rotors.get('III'), 'right', 2);
machine.insertRotor(rotors.get('I'), 'middle', 0);
machine.insertRotor(rotors.get('IV'), 'left', 2);

// a good way to display full debug output
/*
  const testString = 'ABCDE';
  console.log(
    'test output:',
    machine.encryptString(testString, true)
      .split('')
      .map((x, i) => [testString[i], x]),
  );
*/

console.log(machine.encryptString('ABCDE FGHIJ'));
console.log(machine.encrypt('B'));
