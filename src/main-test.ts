import { Plugin } from 'obsidian';

export default class TestPlugin extends Plugin {
    onload() {
        console.log('Loading Test Plugin');

        this.addRibbonIcon('dice', 'Test Plugin', (evt: MouseEvent) => {
            console.log('Test Plugin ribbon clicked');
        });

        this.addCommand({
            id: 'test-command',
            name: 'Test Command',
            callback: () => {
                console.log('Test Command executed');
            }
        });
    }

    onunload() {
        console.log('Unloading Test Plugin');
    }
}
