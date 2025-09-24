import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background: #f5f5f5;
    color: #333;
  }

  * {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
  }
`;
