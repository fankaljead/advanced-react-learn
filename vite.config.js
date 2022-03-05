/*
 * @Author: Zhou Xianghui
 * @Date: 2022-01-13 12:57:54
 * @LastEditors: Zhou Xianghui
 * @LastEditTime: 2022-03-05 10:19:55
 * @FilePath: \advancend-react\vite.config.js
 * @Description:
 * after a long, long, long time
 * Copyright (c) 2022 by Zhou Xianghui/Qianjiang Tech, All Rights Reserved.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
import reactCssModule from "vite-plugin-react-css-modules";
const generateScopedName = "[name]__[local]___[hash:base64:5]";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactCssModule({
      generateScopedName,
      filetypes: {
        ".less": {
          syntax: "postcss-less",
        },
        ".css": {
          syntax: "postcss",
        },
      },
    }),
    reactRefresh(),
  ],
  css: {
    modules: {
      generateScopedName,
    },
  },
});
