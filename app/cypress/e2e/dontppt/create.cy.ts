/// <reference types="cypress" />

describe("Módulo_PPT", () => {
  const ACCEPTED_FILE = "FORGE-Aplicativo-de-Academia.pptx"
  const NOT_ACCEPTED_FILE = "Lista 03 Geometria Analítica e Álgebra Linear.pdf"


  beforeEach(() => {
    cy.visit("http://localhost:5173/ppt");
  });

  it("dado um arquivo de slides e um slug válido, quando o usuário clicar no botão de enviar, então deve ser criada uma página com o slide enviado", () => {
    cy.fixture(ACCEPTED_FILE, null).then(
      (fileContent) => {
        cy.get("input[name='file']").selectFile(
          {
            contents: fileContent,
            fileName: ACCEPTED_FILE,
            mimeType:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
          { force: true },
        );
      },
    );

    cy.get("button[type='submit']").should("be.disabled")

    cy.get("input[name='slug']").type("camisa do flamengo")
    cy.get("input[name='slug']").should("have.value", "camisa-do-flamengo")


    cy.get("button[type='submit']").should("be.enabled")
  });

  it("deve manter o botão de Enviar desativado quando o slug estiver vazio e o arquivo for válido", () =>{
    cy.fixture(ACCEPTED_FILE, null).then(
      (fileContent) => {
        cy.get("input[name='file']").selectFile(
          {
            contents: fileContent,
            fileName: ACCEPTED_FILE,
            mimeType:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
          { force: true },
        );
      },
    );

    cy.get("button[type='submit']").should("be.disabled")

    cy.get("input[name='slug']").should("have.value", "")


    cy.get("button[type='submit']").should("be.disabled")
  })

  it("deve manter o botão de Enviar desativado quando o slug for válido e o arquivo não pertencer as extensões de um arquivo de slide", () =>{
    cy.fixture("Lista 03 Geometria Analítica e Álgebra Linear.pdf", null).then(
      (fileContent) => {
        cy.get("input[name='file']").selectFile(
          {
            contents: fileContent,
            fileName: NOT_ACCEPTED_FILE,
            mimeType:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
          { force: true },
        );
      },
    );

    cy.get("button[type='submit']").should("be.disabled")

    cy.get("input[name='slug']").type("camisa do flamengo")
    cy.get("input[name='slug']").should("have.value", "camisa-do-flamengo")


    cy.get("button[type='submit']").should("be.disabled")
  })

  it("deve manter o botão de Enviar desativado quando o slug conter somente espaçamento em branco e o arquivo for válido", () =>{
    cy.fixture(ACCEPTED_FILE, null).then(
      (fileContent) => {
        cy.get("input[name='file']").selectFile(
          {
            contents: fileContent,
            fileName: ACCEPTED_FILE,
            mimeType:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
          { force: true },
        );
      },
    );

    cy.get("button[type='submit']").should("be.disabled")

    cy.get("input[name='slug']").type("           ")
    cy.get("input[name='slug']").should("have.value", "")


    cy.get("button[type='submit']").should("be.disabled")
  })
});
