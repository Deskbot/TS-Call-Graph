export const data = {
    nodes: [{ "name": "constructor" }, { "name": "method1" }, { "name": "method2" }, { "name": "property" }, { "name": "property" }, { "name": "staticMethod" }],
    links: [{ "source": "constructor", "target": "field1" }, { "source": "constructor", "target": "field2" }, { "source": "constructor", "target": "field3" }, { "source": "constructor", "target": "method2" }, { "source": "method1", "target": "field3" }, { "source": "method1", "target": "field1" }, { "source": "method1", "target": "method1" }, { "source": "method2", "target": "field1" }, { "source": "method2", "target": "field2" }, { "source": "method2", "target": "staticMethod" }, { "source": "property", "target": "field1" }, { "source": "property", "target": "field4" }, { "source": "property", "target": "staticField1" }, { "source": "staticMethod", "target": "staticField1" }],
}