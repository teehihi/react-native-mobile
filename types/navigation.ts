export type RootStackParamList = {
  Intro: undefined;
  Homepage: undefined;
};

export type NavigationProps = {
  navigation: {
    replace: (screen: keyof RootStackParamList) => void;
    navigate: (screen: keyof RootStackParamList) => void;
  };
};