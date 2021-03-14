var workspaceXml = String.raw`<?xml version="1.0"?>
<xml id="blocklyDefault" style="display: none">
  <block type="variables_set">
    <field name="VAR">Count</field>
    <value name="VALUE">
      <block type="math_number">
        <field name="NUM">1</field>
      </block>
    </value>
    <next>
      <block type="controls_whileUntil" x="16" y="16">
        <field name="MODE">WHILE</field>
        <value name="BOOL">
          <block type="logic_compare">
            <field name="OP">LTE</field>
            <value name="A">
              <block type="variables_get">
                <field name="VAR">Count</field>
              </block>
            </value>
            <value name="B">
              <block type="math_number">
                <field name="NUM">3</field>
              </block>
            </value>
          </block>
        </value>
        <statement name="DO">
          <block type="text_print">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">Hello World!</field>
              </block>
            </value>
            <next>
              <block type="variables_set">
                <field name="VAR">Count</field>
                <value name="VALUE">
                  <block type="math_arithmetic">
                    <field name="OP">ADD</field>
                    <value name="A">
                      <block type="variables_get">
                        <field name="VAR">Count</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="math_number">
                        <field name="NUM">1</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>
`