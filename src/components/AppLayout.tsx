import type { HTMLAttributes } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background: #333;
  color: #fff;
  padding: 1rem;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
`;

const Footer = styled.footer`
  background: #eee;
  padding: 1rem;
  text-align: center;
`;

type Props = HTMLAttributes<HTMLDivElement>;

export default function AppLayout({ children, ...props }: Props) {
  return (
    <Wrapper>
      <Header>Dialogue Expander Editor</Header>
      <Main {...props}>{children}</Main>
      <Footer>© 2025 Dialogue Expander</Footer>
    </Wrapper>
  );
}
