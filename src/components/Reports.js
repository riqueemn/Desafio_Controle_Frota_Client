import React, { useState, useEffect } from 'react';
import { Table, Tabs } from 'antd';
import { getDeliveriesReport, getDriversReport, getTrucksReport } from '../services/reportService';

const { TabPane } = Tabs;

const Reports = () => {
  const [deliveriesReport, setDeliveriesReport] = useState([]);
  const [driversReport, setDriversReport] = useState([]);
  const [trucksReport, setTrucksReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [deliveries, drivers, trucks] = await Promise.all([
        getDeliveriesReport(),
        getDriversReport(),
        getTrucksReport(),
      ]);
      setDeliveriesReport(deliveries);
      setDriversReport(drivers);
      setTrucksReport(trucks);
    } catch (error) {
      console.error('Error fetching reports', error);
    }
    setLoading(false);
  };

  const deliveriesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Data', dataIndex: 'date', key: 'date' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    // Adicionar outras colunas conforme necessário
  ];

  const driversColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Caminhão Associado', dataIndex: 'associatedTruck', key: 'associatedTruck' },
    { title: 'Entregas Realizadas', dataIndex: 'deliveriesCompleted', key: 'deliveriesCompleted' },
    // Adicionar outras colunas conforme necessário
  ];

  const trucksColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Modelo', dataIndex: 'model', key: 'model' },
    { title: 'Placa', dataIndex: 'plate', key: 'plate' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    // Adicionar outras colunas conforme necessário
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Entregas" key="1">
          <Table columns={deliveriesColumns} dataSource={deliveriesReport} loading={loading} rowKey="id" />
        </TabPane>
        <TabPane tab="Motoristas" key="2">
          <Table columns={driversColumns} dataSource={driversReport} loading={loading} rowKey="id" />
        </TabPane>
        <TabPane tab="Caminhões" key="3">
          <Table columns={trucksColumns} dataSource={trucksReport} loading={loading} rowKey="id" />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;
