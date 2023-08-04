import { createTheme, ThemeOptions } from '@mui/material/styles'
// import NextLink from 'next/link'
// import { forwardRef } from 'react'

// const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref) {
//   // @ts-ignore
//   return (<NextLink ref={ref} {...props} />)
// })

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  // components: {
  //   MuiLink: {
  //     defaultProps: {
  //       component: LinkBehaviour,
  //     },
  //   },
  //   MuiButtonBase: {
  //     defaultProps: {
  //       LinkComponent: LinkBehaviour,
  //     },
  //   },
  // },
}

const customTheme = createTheme(themeOptions)

export default customTheme
