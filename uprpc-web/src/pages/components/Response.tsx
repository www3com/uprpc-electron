import React, {useState} from "react";
import {Dropdown, Menu, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import Stream from "@/pages/components/Stream";
import {Method, Mode, parseTypeMap, ResponseCache} from "@/types/types";

interface responseProps {
    method: Method,
    responseCache?: ResponseCache,
    onChange: (method: Method) => void
}

export default ({method, responseCache, onChange}: responseProps) => {
    console.log('method: ', method)
    const handleChange = (key: string, index: number, parseTypeNo: number) => {
        if (method.responseMetadata == null) {
            method.responseMetadata = new Map<string, Map<number, number>>();
        }

        let md = method.responseMetadata?.get(key);
        if (md == null) {
            md = new Map<number, number>();
        }
        md.set(index, parseTypeNo);
        method.responseMetadata?.set(key, md);
        console.log('aaaa ', method)
        onChange({...method});
    }

    let metadata = responseCache?.metadata;
    let metadataList = [];
    if (metadata) {
        for (let key in metadata) {
            let value: any = metadata[key];
            if (/-bin$/.test(key)) {
                let convertItems = []
                for (let v of value) {
                    convertItems.push(v)
                }
                console.log('llll ', key)
                metadataList.push({
                    id: key,
                    name: key,
                    value: <BufferValue name={key} items={convertItems} method={method} onChange={handleChange}/>
                });
            } else {
                metadataList.push({id: key, name: key, value: value.join(',')});
            }
        }
    }

    const tab = method.mode == Mode.ServerStream || method.mode == Mode.BidirectionalStream ?
        {key: 'response', label: 'Response Stream', children: <Stream value={responseCache?.streams}/>} : {
            key: ' response', label: 'Response',
            children: <AceEditor
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
                value={responseCache?.body}
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
        }

    const columns = [
        {title: 'name', dataIndex: 'name', key: 'name'},
        {title: 'Value', dataIndex: 'value', key: 'value'}
    ];

    const tabItems = [tab, {
        label: 'Metadata', key: 'matadata',
        children: <Table size='small' bordered={true} pagination={false} columns={columns} rowKey='id'
                         dataSource={metadataList}/>
    }];

    return <Tabs style={{height: "100%"}} animated={false} items={tabItems}/>;
}


interface BufferValueProp {
    name: string,
    items: any[],
    method: Method,
    onChange: (key: string, index: number, parseTypeNo: number) => void
}

const BufferValue = ({name, items, method, onChange}: BufferValueProp) => {
    let menus: any[] = [];
    parseTypeMap.forEach((value, key, map) => {
        menus.push({key: key.toString(), label: value})
    });


    const convert = (value: any, index: number) => {
        let types = method?.responseMetadata?.get(name);
        if (types == null || types.get(index) == null) {
            return '[Buffer ... ' + value.length + ' bytes]'
        }
        let type = types.get(index);
        if (type != null) {
            return convertValue(value, type)
        }
    }

    return (<div>
            {items.map(function (v, index) {
                return <span>
                    {index == 0 ? "" : ", "}
                    <Dropdown overlay={<Menu onClick={(item) => onChange(name, index, Number.parseInt(item.key))}
                                             items={menus}/>}>
                        <a>{convert(v, index)}</a>
                    </Dropdown>
                </span>
            })}
        </div>
    );
}

const convertValue = (value: any, parseType: number) => {
    return '翻译过';
}