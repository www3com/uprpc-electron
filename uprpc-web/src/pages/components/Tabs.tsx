import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Button, Select, Space, Table, Tabs} from "antd";
import "allotment/dist/style.css";
import Editor from "@/pages/components/Editor";
import {EyeOutlined} from "@ant-design/icons";
import {context} from '../../stores/store'

const tabs = () => {
    let {store} = useContext(context)
    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        store.remove(targetKey)
    };

    const extra = <Space size={0} style={{marginRight: 10}}>
        <Select defaultValue="1" style={{width: 180}} bordered={false}>
            <Select.Option value="1">No Environment</Select.Option>
            <Select.Option value="2">Lucy</Select.Option>
        </Select>
        <Button type='text' icon={<EyeOutlined/>} size="large"/>
    </Space>;

    return (<Tabs hideAdd type="editable-card" onEdit={onEdit} style={{height: "100%"}} size='small'
                  onTabClick={(key: string) => store.selectTab(key)}
                  activeKey={store.selectedTab}
                  tabBarExtraContent={extra}>
        {store.tabs.map((value: any) => {
            return (<Tabs.TabPane tab={value.title} key={value.key} style={{height: "100%"}}>
                <Editor methodId={value.key}/>
            </Tabs.TabPane>)
        })}
    </Tabs>)
}

export default observer(tabs)