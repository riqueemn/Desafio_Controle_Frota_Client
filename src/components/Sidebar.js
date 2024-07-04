import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Importe o arquivo CSS aqui

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/frota">Frota</Link></li>
        <li><Link to="/entregas">Entregas</Link></li>
        <li><Link to="/motoristas">Motoristas</Link></li>
        <li><Link to="/configuracoes">Configurações</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
