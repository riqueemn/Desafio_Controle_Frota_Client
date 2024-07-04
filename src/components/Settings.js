import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://desafio-controle-frota-api.onrender.com/api/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Error fetching users');
    }
    setLoading(false);
  };

  const handleAddUser = async (values) => {
    try {
      const response = await axios.post('https://desafio-controle-frota-api.onrender.com/api/users', values);
      setUsers([...users, response.data]);
      setModalVisible(false);
      form.resetFields();
      message.success('User added successfully');
    } catch (error) {
      message.error('Error adding user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    try {
      const response = await axios.put(`https://desafio-controle-frota-api.onrender.com/api/users/${editingUser.id}`, values);
      setUsers(users.map(user => user.id === editingUser.id ? response.data : user));
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      message.success('User updated successfully');
    } catch (error) {
      message.error('Error updating user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`https://desafio-controle-frota-api.onrender.com/api/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Error deleting user');
    }
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(values => {
        if (editingUser) {
          handleUpdateUser(values);
        } else {
          handleAddUser(values);
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEditUser(record)} type="primary">Editar</Button>
          <Button onClick={() => handleDeleteUser(record.id)} type="danger" style={{ marginLeft: 8 }}>Excluir</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Adicionar Usuário
      </Button>
      <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />
      <Modal
        title={editingUser ? "Editar Usuário" : "Adicionar Usuário"}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Por favor insira o nome' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="Permissões" rules={[{ required: true, message: 'Por favor insira as permissões' }]}>
            <Select mode="multiple">
              <Option value="read">Leitura</Option>
              <Option value="write">Escrita</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
