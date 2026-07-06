/// <reference types="cypress" />

describe("Página de upload do módulo PPT", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/ppt");
  });

  it("Criação da página", () => {
    cy.fixture("FORGE-Aplicativo-de-Academia.pptx", null).then(
      (fileContent) => {
        cy.get("input[name='file']").selectFile(
          {
            contents: fileContent,
            fileName: "slide.pptx",
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
});
