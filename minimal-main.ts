import { Plugin } from 'obsidian';

export default class MinimalPlugin extends Plugin {
    onload() {
        console.log('Minimal plugin is loading!');
        this.addRibbonIcon('dice', 'Minimal Plugin', () => {
            console.log('Minimal plugin clicked!');
        });
    }

    onunload() {
        console.log('Minimal plugin is unloading!');
    }
}
