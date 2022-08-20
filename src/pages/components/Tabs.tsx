import React, {useState} from "react";
import {inject, observer} from "mobx-react";
import {Button, Select, Space, Table, Tabs} from "antd";
import "allotment/dist/style.css";
import Editor from "@/pages/components/Editor";
import {EyeOutlined} from "@ant-design/icons";
const tabs = ({store}: any) => {

    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        store.remove(targetKey)
    };

    const extra = <Space size={0} style={{marginRight: 10}}>
        <Select defaultValue="1" style={{width: 180}} bordered={false} >
            <Select.Option value="1">No Environment</Select.Option>
            <Select.Option value="2">Lucy</Select.Option>
        </Select>
        <Button type='text' icon={<EyeOutlined />} size="large"/>
    </Space>;

    return (<Tabs hideAdd type="editable-card" onEdit={onEdit} style={{height: "100%"}} size='small'
                  tabBarExtraContent={extra}>
        {store.tabs.map((value: { id: number, title: string }) => {
            return (<Tabs.TabPane tab={value.title} key={value.id} style={{height: "100%"}}>
                <Editor/>
            </Tabs.TabPane>)
        })}
    </Tabs>)
}

export default inject('store')(observer(tabs))