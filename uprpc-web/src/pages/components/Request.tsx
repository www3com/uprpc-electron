import React, {useState} from "react";
import {Button, Card, Table, Tabs, Tooltip} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import {Allotment} from "allotment";
import Stream from "@/pages/components/Stream";
import {CloudUploadOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {Method, Mode, RequestCache} from "@/types/types";
import styles from '../style.less';
import {v4} from 'uuid';

interface requestProps {
    running: boolean,
    method: Method,
    requestCache?: RequestCache,
    onChange?: (method: Method) => void,
    onPush: (body: string) => void
}

export default ({running, method, requestCache, onChange, onPush}: requestProps) => {

    let [body, setBody] = useState(method.requestBody);
    const aceChange = (value: string) => {
        if (onChange) {
            onChange({...method, requestBody: value});
        }
        setBody(value);
    }

    const [datasource, setDatasource] = useState(method.requestMetadata == null ? [] : method.requestMetadata);
    const onEdit = (index: number, column: string, value: any) => {
        datasource[index][column] = value;
        if (onChange) {
            onChange({...method, requestMetadata: datasource});
        }
    }

    const onAdd = () => {
        datasource.push({id: v4(), name: '', value: ''});
        setDatasource([...datasource]);
    }

    const onDelete = (index: number) => {
        datasource.splice(index, 1);
        setDatasource([...datasource]);
    }

    let isStream = method.mode == Mode.ClientStream || method.mode == Mode.BidirectionalStream;
    let pushButton = running && isStream ?
        <Button size='small' type='primary' icon={<CloudUploadOutlined/>}
                onClick={() => onPush(body)}>Push</Button> : '';
    const items = [{
        label: 'Params', key: 'params', children:
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
    }, {
        label: 'Metadata', key: 'metadata', children:
            <Table rowKey='id'
                   size={'small'}
                   bordered={true}
                   pagination={false}
                   dataSource={datasource}>
                <Table.Column className={styles.metadataColumn} key='key' dataIndex='key' title='key' align='center'
                              width={'30%'}
                              render={(text: string, record: any, index: number) => {
                                  return <input key={'key' + record.id} defaultValue={record.name}
                                                onChange={(e) => onEdit(index, 'name', e.target.value)}/>
                              }}/>
                <Table.Column className={styles.metadataColumn} key='value' dataIndex='value' title='value'
                              align='center'
                              render={(text: string, record: any, index: number) => {
                                  return <input key={'value' + record.id} defaultValue={record.value}
                                                onChange={(e) => onEdit(index, 'value', e.target.value)}/>
                              }}/>
                <Table.Column className={styles.metadataColumn} key='action' dataIndex='action' align='center'
                              width={80}
                              title={<Tooltip title='Add metadata'>
                                  <Button size='small' type='text' icon={<PlusCircleOutlined/>} onClick={onAdd}/>
                              </Tooltip>}
                              render={(text: string, record: any, index: number) => {
                                  return <Tooltip title='Delete metadata' placement='bottom'><Button size={"small"} type='text'
                                                                                  icon={<MinusCircleOutlined/>}
                                                                                  onClick={() => onDelete(index)}/></Tooltip>
                              }}/>
            </Table>
    }];

    return (
        <Allotment>
            <Tabs style={{height: "100%"}} animated={false} items={items}
                  tabBarExtraContent={<div style={{paddingRight: 10}}>{pushButton}</div>}/>
            <Allotment.Pane visible={isStream} className={styles.requestStreamHeight}>
                <Card title='Request Stream' size={"small"} bordered={false} style={{height: '100%'}}
                      bodyStyle={{height: 'calc(100% - 40px)', overflow: "auto", padding: 0}}>
                    <Stream value={requestCache?.streams}/>
                </Card>
            </Allotment.Pane>
        </Allotment>
    )
}