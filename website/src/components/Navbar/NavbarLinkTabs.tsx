// import { Link, Tab, Tabs } from '@mui/material'
// import { styled } from '@mui/material/styles'
// import NextLink from 'next/link'

// type NavbarLinkPillProps = {
//   href: string
//   label: string
// }

// interface StyledTabsProps {
//   children?: React.ReactNode
//   value: number
//   onChange: (event: React.SyntheticEvent, newValue: number) => void
// }

// interface StyledTabProps {
//   label: string
// }

// export const NavbarStyledTabs = styled((props: StyledTabsProps) => (
//   <Tabs
//     {...props}
//     TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
//   />
// ))({
//   '& .MuiTabs-indicator': {
//     display: 'flex',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//   },
//   '& .MuiTabs-indicatorSpan': {
//     maxWidth: 75,
//     width: '100%',
//     backgroundColor: '#4898F0',
//   },
// })

// const StyledLink = styled(Link)(({ theme }) => ({
//   // color: '#333',
//   width: '100%',
//   backgroundColor: 'rgb(247, 249, 252)',
//   padding: '8px 20px',
//   borderRadius: '6px !important',
//   textDecoration: 'none',
//   // fontSize: '1.2rem',
//   // transition: 'box-shadow 0.2s ease-in-out',
//   transition: 'background-color 0.2s ease-in-out',
//   '&:hover': {
//     // boxShadow: '0 0 20px 2px rgba(130, 130, 130, 0.13)',
//     backgroundColor: 'rgb(201, 230, 252)',
//   },
//   //
//   // textTransform: 'none',
//   // fontWeight: theme.typography.fontWeightRegular,
//   // fontSize: theme.typography.pxToRem(15),
//   // marginRight: theme.spacing(1),
//   // color: 'rgba(255, 255, 255, 0.7)',
//   // '&.Mui-selected': {
//   //   color: '#fff',
//   // },
//   // '&.Mui-focusVisible': {
//   //   backgroundColor: 'rgba(100, 95, 228, 0.32)',
//   // },
// })) as typeof Link

// const StyledTab = styled((props: StyledTabProps) => (
//   <Tab disableRipple {...props} />
// ))(({ theme }) => ({
//   textTransform: 'none',
//   fontWeight: theme.typography.fontWeightRegular,
//   fontSize: theme.typography.pxToRem(15),
//   marginRight: theme.spacing(1),
//   color: 'rgba(255, 255, 255, 0.7)',
//   '&.Mui-selected': {
//     color: '#fff',
//   },
//   '&.Mui-focusVisible': {
//     backgroundColor: 'rgba(100, 95, 228, 0.32)',
//   },
// }))

// export function NavbarStyledLinkTab(props: NavbarLinkPillProps) {
//   return (
//     // <NextLink href={props.href} passHref>
//       <Tab
//         component={StyledLink}
//         LinkComponent={NextLink}
//         href={props.href}
//         label={props.label}
//       />
//     // </NextLink>
//   )
// }
