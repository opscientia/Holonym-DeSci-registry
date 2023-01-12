// material
import { GlobalStyles as GlobalThemeStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// ----------------------------------------------------------------------

export default function GlobalStyles() {
  const theme = useTheme();

  return (
    <GlobalThemeStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          width: '100%',
          height: '100vh',
          color:'#FDF5FF',
          background:'url(../../public/assets/images/verse.png),  #070A1B',
          // backgroundAttachment:'fixed',
          backgroundPosition:'center'
        },
        '#root': {
          width: '100%',
          height: '100%',
        },

        '.swiper-button-next:after, .swiper-rtl .swiper-button-prev:after': {
          display: 'none',
        },

        '.swiper-button-prev:after, .swiper-rtl .swiper-button-next:after': {
          display: 'none',
        },
      }}
    />
  );
}
