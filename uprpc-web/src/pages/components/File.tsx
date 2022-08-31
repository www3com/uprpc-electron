import React, {Key, useContext} from "react";
import {observer} from "mobx-react-lite";
import {Button, Layout, notification, Space, Tabs, Tree, TreeDataNode} from "antd";
import {
    ApiOutlined, CloseCircleOutlined, CreditCardOutlined, DatabaseOutlined, DownOutlined, FileOutlined,
    HddOutlined,
    PlusCircleOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {context} from "@/stores/store";

const file = () => {
    let {store} = useContext(context)

    const parse = (files: any) => {
        let treeData = [];
        for (let f of files) {
            let fileItem: any = {
                key: f.id,
                title: f.name,
                icon: <FileOutlined/>,
                children: []
            };


            for (let service of f.services) {
                let methods = [];
                for (let m of service.methods) {
                    methods.push({
                        key: m.id,
                        title: m.name,
                        icon: <ApiOutlined/>,
                    })
                }

                fileItem.children.push({
                    key: service.id,
                    title: service.name,
                    icon: <DatabaseOutlined/>,
                    children: methods
                })
            }
            treeData.push(fileItem)
        }
        return treeData;
    }


    const onSelect = (selectedKeys: Key[], e: any) => {
        let pos = e.node.pos.split('-')
        if (pos.length != 4) {
            return
        }
        store.openTab(selectedKeys[0].toString(), e.node.title, 'file')
    }

    const onImport = async () => {
        const result = await store.importFile()
        debugger
        if (!result.success) {
            notification.open({
                message: 'Error while importing protos',
                description: result.message,
                icon: <CloseCircleOutlined style={{color: 'red'}}/>
            });
        }
    }

    const grpc = (<Space direction='vertical' size={0} align={"center"}>
        <HddOutlined style={{fontSize: 20, marginRight: 0}}/>
        <div style={{fontSize: 10}}>GRPC</div>
    </Space>)
    const env = (<Space direction='vertical' size={0}>
        <SettingOutlined style={{fontSize: 20, marginRight: 0}}/>
        <div style={{fontSize: 10}}>ENV</div>
    </Space>)

    return (
        <Layout style={{height: '100%', paddingTop: '5px'}}>
            <Layout.Header style={{
                padding: 0,
                backgroundColor: 'white',
                height: '40px',
                lineHeight: '40px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'end',
                    justifyItems: 'end'
                }}>
                    <Button type='text' icon={<PlusCircleOutlined/>} onClick={onImport}>Import</Button>
                </div>
            </Layout.Header>
            <Layout.Content style={{backgroundColor: 'white'}}>
                <Tabs tabPosition='left' size='small' style={{height: '100%'}}>
                    <Tabs.TabPane tab={grpc} key="2" style={{height: "100%", overflow: 'auto'}}>
                        <Tree.DirectoryTree
                            onSelect={onSelect}
                            switcherIcon={<DownOutlined/>}
                            defaultExpandedKeys={['0-0-0']}
                            treeData={parse(store.files)}
                        />

                    </Tabs.TabPane>
                    <Tabs.TabPane tab={env} key="3">

                    </Tabs.TabPane>

                </Tabs>
            </Layout.Content>
        </Layout>
    )
}

export default observer(file)