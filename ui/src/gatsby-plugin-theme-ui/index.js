export default {
  colors: {
    text: '#1E252C',
    background: '#fff',
    primary: '#1E252C',
    secondary: '#4C66FF'
  },
  fonts: {
    body: 'monospace',
    heading: 'monospace'
  },
  fontWeights: {
    body: 400,
    heading: 600
  },
  space: [0, 4, 8, 16, 32, 64, 96, 128],
  styles: {
    body: {
      fontFamily: 'body'
    },
    root: {
      position: 'relative'
    },
    Main: {
      padding: '90px 0'
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
      letterSpacing: '-0.5px'
    },
    a: {
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
      }
    },
    secondary: {
      color: 'text',
      bg: 'secondary'
    }
  }
}
