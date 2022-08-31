import React, {useState} from "react";
import {Button, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import {RequestProp} from "@/stores/store";

interface requestProps {
    value?: RequestProp,
    onChange?: (value: RequestProp) => void
}

export default ({value, onChange}: requestProps) => {

    console.log("value: ", value)

    const [body, setBody] = useState(value?.body);
    const [metadata, setMetadata] = useState(value?.metadata);

    const aceChange = (v: string) => {
        setBody(v)
    }

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'},
        {
            title: 'Action', dataIndex: 'action', key: 'action',
            render: (text: string, record: any) => (<a>编码</a>)
        }
    ];

    return (<Tabs style={{height: "100%"}} animated={false}>
        <Tabs.TabPane tab='Params' key='params'>
            <AceEditor
                style={{background: "#fff"}}
                width={"100%"}
                height='100%'
                mode="json"
                theme="textmate"
                name="inputs"
                fontSize={13}
                cursorStart={2}
                showPrintMargin={false}
                showGutter
                onChange={aceChange}
                defaultValue={JSON.stringify(value, null, 2)}
                setOptions={{
                    useWorker: true,
                    displayIndentGuides: true
                }}
                tabSize={2}
            />
        </Tabs.TabPane>
        <Tabs.TabPane tab='Metadata' key='metadata'>
            <Table size='small' bordered={true} pagination={false} dataSource={value?.metadata  } columns={columns}/>
        </Tabs.TabPane>
    </Tabs>)
}