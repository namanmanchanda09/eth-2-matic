import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

// global.Buffer = require('buffer').Buffer

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeScript initialColorMode='light' />
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

