import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(Link)`
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    background: #45a049;
  }
`;

export default function Home() {
  return (
    <Container>
      <Title>Dialogue Expander Tool</Title>
      <Description>
        JSON 파일을 작성하거나, CP(Content Patcher) JSON을 변환할 수 있습니다.
      </Description>
      <ButtonGroup>
        <Button to="/editor">JSON 에디터</Button>
        <Button to="/converter">CP 변환기</Button>
      </ButtonGroup>
    </Container>
  );
}
