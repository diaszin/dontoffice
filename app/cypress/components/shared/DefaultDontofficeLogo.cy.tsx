/// <reference types="cypress" />


import DefaultDontofficeLogo from '../../../src/components/shared/DefaultDontofficeLogo'

describe('<DefaultDontofficeLogo />', () => {
  it('Renderiza componente de logo com props vazias', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<DefaultDontofficeLogo name={''} initialGradientColor={''} finalGradientColor={''} />)
  })
})