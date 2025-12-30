class TestPlugin extends Plugin {
    onload() {
        console.log("Test plugin loaded!");
        this.addRibbonIcon('help-circle', 'Test Plugin', () => {
            console.log("Test clicked");
        });
    }

    onunload() {
        console.log("Test plugin unloaded!");
    }
}
