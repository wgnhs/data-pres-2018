import { TableLayout } from './layout/table-layout.js';
import { LogLayout } from './layout/log-layout.js';
import { CoreLayout } from './layout/core-layout.js';


const defaultLayout = TableLayout;
const availableLayouts = [
  defaultLayout,
  LogLayout,
  CoreLayout
];

export const layoutResolver = {
  getLayout: function getLayout(layoutName) {
    let layout = availableLayouts.find((el) => {
      return el.layoutName === layoutName;
    });
    if (!layout) {
      layout = defaultLayout;
    }
    return layout.include;
  }
}