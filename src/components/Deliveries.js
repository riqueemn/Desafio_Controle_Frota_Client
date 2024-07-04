import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [destinations, setDestination] = useState([]);
  const [cargas, setCarga] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterTruck, setFilterTruck] = useState('');

  useEffect(() => {
    fetchDeliveries();
    fetchTrucks();
    fetchDrivers();
    fetchAddresses();
    fetchCargas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, filterTruck, deliveries]);

  const applyFilters = () => {
    let filtered = deliveries;
  
    if (searchText) {
      filtered = filtered.filter(delivery =>
        delivery.destination.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  
    if (filterTruck) {
      filtered = filtered.filter(delivery => delivery.truckId === filterTruck);
    }
  
    setFilteredDeliveries(filtered);
  };
  
  const fetchDeliveries = async () => {
    const result = await axios.get('https://desafio-controle-frota-api.onrender.com/api/deliveries');
    const deliveriesData = result.data;

    // Fetch trucks and drivers data to join with deliveries
    const trucksData = await axios.get('https://desafio-controle-frota-api.onrender.com/api/trucks');
    const driversData = await axios.get('https://desafio-controle-frota-api.onrender.com/api/drivers');

    const deliveriesWithDetails = deliveriesData.map(delivery => {
      const truck = trucksData.data.find(t => t.id === delivery.truckId);
      const driver = driversData.data.find(d => d.id === parseInt(delivery.driverId));
      return {
        ...delivery,
        truckModel: truck ? truck.model + " - ("+truck.plate+")" : 'Desconhecido',
        driverName: driver ? "("+driver.id+") - " + driver.name : 'Desconhecido',
      };
    });

    setDeliveries(deliveriesWithDetails);
  };

  const fetchTrucks = async () => {
    const result = await axios.get('https://desafio-controle-frota-api.onrender.com/api/trucks');
    setTrucks(result.data);
  };

  const fetchDrivers = async () => {
    const result = await axios.get('https://desafio-controle-frota-api.onrender.com/api/drivers');
    setDrivers(result.data);
  };

  const fetchAddresses = async () => {
    const result = await axios.get('https://desafio-controle-frota-api.onrender.com/api/addresses');
    setDestination(result.data);
  };

  const fetchCargas = async () => {
    const result = await axios.get('https://desafio-controle-frota-api.onrender.com/api/cargas');
    setCarga(result.data);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setCurrentDelivery(null);
    form.resetFields();
  };

  const handleAdicionarEntrega = () => {
    handleCancel();
    setCurrentDelivery(null);
    form.resetFields();
    showModal();
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && currentDelivery) {
        await axios.put(`http://localhost:3001/api/deliveries/${currentDelivery.id}`, values);
        message.success('Entrega atualizada com sucesso');
      } else {
        values.status = "Pendente"
        await axios.post('http://localhost:3001/api/deliveries', values);
        message.success('Entrega adicionada com sucesso');
      }
      fetchDeliveries();
      handleCancel();
    } catch (error) {
      message.error(error.response.data.message);
    }
  };

  const handleEdit = (record) => {
    console.log(form)
    setCurrentDelivery(record);
    form.setFieldsValue(record);
    setIsEditMode(true);
    showModal();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/deliveries/${id}`);
    fetchDeliveries();
  };

  const handleConcluirEntrega = async (value) => {
    try {
      value.status = "Concluído"
      await axios.put(`http://localhost:3001/api/deliveries/${value.id}`, value);
      message.success('Entrega concluída com sucesso');
      fetchDeliveries();
    } catch (error) {
      message.error('Erro ao concluir a entrega');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Caminhão', dataIndex: 'truckModel', key: 'truckModel' },
    { title: 'Motorista', dataIndex: 'driverName', key: 'driverName' },
    {
      title: 'Tipo de Carga',
      dataIndex: 'cargoType',
      key: 'cargoType',
      render: (cargoType, record) => {
        const hasInsurance = record.hasInsurance;
        return (
          <>
            {cargoType}
            {cargoType === 'Eletrônicos' && (
              <span style={{ marginLeft: 8 }}>
                {hasInsurance ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>(Segurado)</span>
                ) : (
                  <span style={{ color: 'orange', fontWeight: 'bold' }}>(Não Segurado)</span>
                )}
              </span>
            )}
            {cargoType === 'Combustível' && (
              <span style={{ marginLeft: 8 }}>
                <span style={{ color: 'red', fontWeight: 'bold' }}>(Perigoso)</span>
              </span>
            )}
          </>
        );
      },
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      render: (value) => {
        const isValuable = value > 30000;
        return (
          <>
            R$ {value}
            {isValuable && <span style={{ color: 'gold', fontWeight: 'bold' }}> (Valiosa)</span>}
          </>
        );
      },
    },
    { title: 'Destino', dataIndex: 'destination', key: 'destination' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Ações', key: 'action', render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Editar</Button>
          <Button onClick={() => handleDelete(record.id)} danger>Excluir</Button>
          {record.status !== 'Concluído' && (
            <Button onClick={() => handleConcluirEntrega(record)} style={{ marginLeft: 8 }}>
              Concluir
            </Button>
          )}
        </>
      )
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input
            placeholder="Buscar por destino"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={12}>
          <Select
            placeholder="Filtrar por caminhão"
            value={filterTruck}
            onChange={value => setFilterTruck(value)}
            style={{ width: '100%' }}
          >
            <Option value="">Todos os Caminhões</Option>
            {trucks.map(truck => (
              <Option key={truck.id} value={truck.id}>{truck.model}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Button type="primary" onClick={handleAdicionarEntrega}>Adicionar Entrega</Button>
      <Table columns={columns} dataSource={filteredDeliveries} rowKey="id" />
      <Modal
        title={isEditMode ? 'Editar Entrega' : 'Adicionar Entrega'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          initialValues={currentDelivery}
          onFinish={handleSubmit}
        >
          <Form.Item name="truckId" label="Caminhão" rules={[{ required: true }]}>
            <Select>
              {trucks.map(truck => (
                <Option key={truck.id} value={truck.id}>{truck.model} - ({truck.plate})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="driverId" label="Motorista" rules={[{ required: true }]}>
            <Select>
              {drivers.map(driver => (
                <Option key={driver.id} value={driver.id}>({driver.id}) - {driver.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="cargoType" label="Tipo de Carga" rules={[{ required: true }]}>
            <Select>
              {cargas.map(carga => (
                <Option key={carga.id} value={carga.tipo}>{carga.tipo}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="value" label="Valor" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="Destino" rules={[{ required: true }]}>
            <Select>
              {destinations.map(destination => (
                <Option key={destination.id} value={destination.local}>{destination.local}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="hasInsurance" label="Tem Seguro" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Sim</Option>
              <Option value={false}>Não</Option>
            </Select>
          </Form.Item>
          <Form.Item  visible="false" name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Pendente" Select>Pendente</Option>
              <Option value="Concluída">Concluída</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isEditMode ? 'Atualizar' : 'Adicionar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Deliveries;
