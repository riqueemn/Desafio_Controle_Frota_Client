import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Fleet = () => {
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTrucks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, filterModel, filterStatus, trucks]);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://desafio-controle-frota-api.onrender.com/api/trucks');
      setTrucks(response.data);
      setFilteredTrucks(response.data);
    } catch (error) {
      message.error('Error fetching trucks');
    }
    setLoading(false);
  };

  const handleAddTruck = async (values) => {
    try {
      const response = await axios.post('https://desafio-controle-frota-api.onrender.com/api/trucks', values);
      setTrucks([...trucks, response.data]);
      setModalVisible(false);
      form.resetFields();
      message.success('Truck added successfully');
    } catch (error) {
      message.error('Error adding truck');
    }
  };

  const handleEditTruck = (truck) => {
    setEditingTruck(truck);
    form.setFieldsValue(truck);
    setModalVisible(true);
  };

  const handleUpdateTruck = async (values) => {
    try {
      const response = await axios.put(`https://desafio-controle-frota-api.onrender.com/api/trucks/${editingTruck.id}`, values);
      setTrucks(trucks.map(truck => truck.id === editingTruck.id ? response.data : truck));
      setModalVisible(false);
      setEditingTruck(null);
      form.resetFields();
      message.success('Truck updated successfully');
    } catch (error) {
      message.error('Error updating truck');
    }
  };

  const handleDeleteTruck = async (id) => {
    try {
      await axios.delete(`https://desafio-controle-frota-api.onrender.com/api/trucks/${id}`);
      setTrucks(trucks.filter(truck => truck.id !== id));
      message.success('Truck deleted successfully');
    } catch (error) {
      message.error('Error deleting truck');
    }
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(values => {
        if (editingTruck) {
          handleUpdateTruck(values);
        } else {
          handleAddTruck(values);
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTruck(null);
    form.resetFields();
  };

  const applyFilters = () => {
    let filtered = trucks;

    if (searchText) {
      filtered = filtered.filter(truck =>
        truck.model.toLowerCase().includes(searchText.toLowerCase()) ||
        truck.plate.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterModel) {
      filtered = filtered.filter(truck => truck.model === filterModel);
    }

    if (filterStatus) {
      filtered = filtered.filter(truck => truck.status === filterStatus);
    }

    setFilteredTrucks(filtered);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Modelo', dataIndex: 'model', key: 'model' },
    { title: 'Placa', dataIndex: 'plate', key: 'plate' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEditTruck(record)} type="primary" style={{ marginRight: 8 }}>
            Editar
          </Button>
          <Button onClick={() => handleDeleteTruck(record.id)} type="danger">
            Excluir
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="fleet">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Buscar por modelo ou placa"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder="Filtrar por modelo"
            value={filterModel}
            onChange={value => setFilterModel(value)}
            style={{ width: '100%' }}
          >
            <Option value="">Todos os Modelos</Option>
            {[...new Set(trucks.map(truck => truck.model))].map(model => (
              <Option key={model} value={model}>{model}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="Filtrar por status"
            value={filterStatus}
            onChange={value => setFilterStatus(value)}
            style={{ width: '100%' }}
          >
            <Option value="">Todos os Status</Option>
            <Option value="Disponível">Disponível</Option>
            <Option value="Em Entrega">Em Entrega</Option>
          </Select>
        </Col>
      </Row>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Adicionar Caminhão
      </Button>
      <Table columns={columns} dataSource={filteredTrucks} loading={loading} rowKey="id" />
      <Modal
        title={editingTruck ? "Editar Caminhão" : "Adicionar Caminhão"}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="model" label="Modelo" rules={[{ required: true, message: 'Por favor insira o modelo' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="plate" label="Placa" rules={[{ required: true, message: 'Por favor insira a placa' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Por favor selecione o status' }]}>
            <Select>
              <Option value="Disponível">Disponível</Option>
              <Option value="Em Entrega">Em Entrega</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Fleet;
