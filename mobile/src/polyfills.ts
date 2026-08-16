import 'react-native-get-random-values';
import { Buffer } from 'buffer';

const g = globalThis as { Buffer?: typeof Buffer };
if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}
