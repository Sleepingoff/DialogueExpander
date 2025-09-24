import { createBrowserRouter, RouterProvider } from "react-router";
import { GlobalStyle } from "./styles/global";
import Editor from "./pages/Editor";
import { createRoot } from "react-dom/client";
import App from "./App";
import Home from "./pages/Home";
import Converter from "./pages/Converter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // 레이아웃
    children: [
      { index: true, element: <Home /> }, // /editor
      { path: "/editor", element: <Editor /> }, // /editor
      { path: "/converter", element: <Converter /> }, // /editor
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyle />
    <RouterProvider router={router} />
  </>
);
