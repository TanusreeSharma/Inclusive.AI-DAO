import { ServerStyleSheets } from '@mui/styles'
import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

const meta = {
  title: 'Inclusive AI DAO',
  description: 'Inclusive AI DAO',
}

export default function AppDocument() {
  return (
    <Html lang="en">
      <Head>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        {/* PWA primary color */}
        {/* <meta name='theme-color' content={theme.palette.primary.main} /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
AppDocument.getInitialProps = async (ctx: any) => {
  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) => (props: any) =>
        sheets.collect(<App {...props} />),
    })

  const initialProps = await Document.getInitialProps(ctx)

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  }
}
