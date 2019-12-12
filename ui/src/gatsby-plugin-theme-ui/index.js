export default {
  colors: {
    text: '#4A4A4A',
    background: '#fff',
    primary: '#1E252C',
    secondary: '#4C66FF',
    tertiary: '#7D7D7D',
    column: '#8A8A8A',
    fill: '#CFCFCF'
  },
  fonts: {
    body: 'Space Mono, monospace',
    heading: 'Space Mono, monospace'
  },
  fontWeights: {
    body: 400,
    heading: 600
  },
  space: [0, 4, 8, 12, 16, 32, 64, 96, 128, 160],
  styles: {
    body: {
      fontFamily: 'body'
    },
    root: {
      position: 'relative'
    },
    Main: {
      py: [5, 7]
    },
    Header: {
      position: 'relative'
    },
    h1: {
      fontWeight: 'heading',
      fontSize: '3.25rem',
      lineHeight: '4rem',
      letterSpacing: '-0.46px',
      margin: 0,
      '@media (max-width: 640px)': {
        fontSize: '2.75rem',
        lineHeight: '3.25rem'
      }
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 'heading',
      letterSpacing: '-0.4px',
      lineHeight: '3.5rem'
    },
    h3: {
      fontSize: '2.5rem',
      lineHeight: '3rem',
      fontWeight: 'bold',
      color: '#4C66FF',
      '@media (max-width: 640px)': {
        fontSize: '1.5rem',
        lineHeight: '2.5rem'
      }
    },
    h4: {
      fontSize: '2rem',
      lineHeight: '2.75rem',
      fontWeight: 'bold'
    },
    h6: {
      fontSize: '1.125rem',
      lineHeight: '2rem',
      fontWeight: 'normal'
    },
    p: {
      fontSize: '1rem',
      lineHeight: '2rem',
      letterSpacing: '-0.5px',
      color: 'text'
    },
    a: {
      textDecoration: 'none',
      display: 'block',
      color: '#4C66FF',
      fontSize: '1rem',
      fontWeight: 'bold',
      letterSpacing: '0.31px',
      lineHeight: '2.375rem'
    },
    Link: {
      textDecoration: 'none',
      display: 'block',
      color: '#4C66FF',
      fontSize: '1rem',
      fontWeight: 'bold',
      letterSpacing: '0.31px',
      lineHeight: '2.375rem'
    }
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'secondary',
      fontFamily: 'body',
      fontSize: '1rem',
      letterSpacing: '1px',
      lineHeight: '2.5rem',
      width: ['100%', '250px', '250px'],
      height: '48px',
      cursor: 'pointer',
      '&:focus': {
        outline: 'none'
      },
      '&:hover': {
        opacity: 0.8
      }
    }
  }
}
