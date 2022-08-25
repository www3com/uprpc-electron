import React from "react";
import {Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"

export default () => {
    const dataSource = [
        {
            key: '1',
            name: '胡彦斌',
            age: 32,
            address: '西湖区湖底公园1号',
        },
        {
            key: '2',
            name: '胡彦祖',
            age: 42,
            address: '西湖区湖底公园1号',
        },
    ];

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        }
    ];

    return (<Tabs style={{height: "100%"}} animated={false}>
        <Tabs.TabPane tab='Response' key='response'>
            <AceEditor
                style={{background: "#fff"}}
                width={"100%"}
                height='100%'
                mode="json"
                theme="textmate"
                name="inputs"
                fontSize={13}
                cursorStart={2}
                highlightActiveLine={false}
                showPrintMargin={false}
                showGutter={false}
                // value={data}
                setOptions={{
                    showLineNumbers: false,
                    highlightGutterLine: false,
                    fixedWidthGutter: false,
                    tabSize: 1,
                    displayIndentGuides: false
                }}
                readOnly={true}
                tabSize={2}
            />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Metadata' key='metadata'>
            <Table size='small' bordered={true} pagination={false} dataSource={dataSource} columns={columns}/>
        </Tabs.TabPane>
    </Tabs>)
}
