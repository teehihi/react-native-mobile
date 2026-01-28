import { cssInterop } from 'nativewind';
import { 
  Text, 
  Searchbar, 
  Card, 
  Button, 
  IconButton, 
  Badge,
  ActivityIndicator
} from 'react-native-paper';
import { Image } from 'react-native';

// Register React Native components if not already handled (NativeWind handles Core components usually)
// cssInterop(Image, { className: 'style' }); 

// Register Paper Components
cssInterop(Text, { className: 'style' });
cssInterop(Searchbar, { className: 'style' });
cssInterop(Card, { className: 'style' });
cssInterop(Card.Cover, { className: 'style' });
cssInterop(Card.Content, { className: 'style' });
cssInterop(Card.Actions, { className: 'style' });
cssInterop(Button, { className: 'style' });
cssInterop(IconButton, { className: 'style' });
cssInterop(Badge, { className: 'style' });
cssInterop(ActivityIndicator, { className: 'style' });
