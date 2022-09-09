import React from "react";
import {Button, Card, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import {Allotment} from "allotment";
import Stream from "@/pages/components/Stream";
import {SendOutlined} from "@ant-design/icons";
import {Method, Mode, RequestCache} from "@/types/types";

interface requestProps {
    method: Method,
    requestCache?: RequestCache,
    onChange?: (method: Method) => void
}

export default ({method, requestCache, onChange}: requestProps) => {

    const aceChange = (value: string) => {
        if (onChange) {
            onChange({...method, requestBody: value})
        }
    }

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'},
        {
            title: 'Action', dataIndex: 'action', key: 'action',
            render: (text: string, record: any) => (<a>编码</a>)
        }
    ];

    return (
        <Allotment>
            <Tabs style={{height: "100%"}} animated={false}
                  tabBarExtraContent={<div style={{paddingRight: 10}}><Button icon={<SendOutlined/>}>Push</Button>
                  </div>}>
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
                        defaultValue={method.requestBody}
                        setOptions={{
                            useWorker: true,
                            displayIndentGuides: true
                        }}
                        tabSize={2}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab='Metadata' key='metadata'>
                    <Table size='small' bordered={true} pagination={false} dataSource={method.requestConf}
                           columns={columns}/>
                </Tabs.TabPane>
            </Tabs>
            <Allotment.Pane visible={method.mode == Mode.ClientStream}>
                <Card title='Request Stream' size={"small"} bordered={false}
                      bodyStyle={{height: '100%', overflow: "auto"}}>
                    <Stream value={requestCache?.streams}/>
                </Card>
            </Allotment.Pane>
        </Allotment>
    )
}