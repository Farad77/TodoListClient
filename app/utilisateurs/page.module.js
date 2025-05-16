/* Styles pour la gestion des utilisateurs */
.backLink {
  display: inline-block;
  margin-bottom: 2rem;
  color: #0070f3;
  text-decoration: none;
}

.backLink:hover {
  text-decoration: underline;
}

.usersContainer {
  width: 100%;
  max-width: 800px;
}

.userList {
  list-style: none;
  padding: 0;
  width: 100%;
}

.userItem {
  display: flex;
  justify-content: space-between;
  padding: 1.2rem;
  margin-bottom: 1rem;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.userContent {
  flex: 1;
}

.userContent h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.userContent p {
  margin: 0.25rem 0;
  color: #666;
}

.userActions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 1rem;
  gap: 0.5rem;
}

.viewButton {
  padding: 0.3rem 0.6rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.viewButton:hover {
  background-color: #0051a8;
}